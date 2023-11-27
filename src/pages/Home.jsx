import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import './home.scss';
import PropTypes from 'prop-types';

// Home コンポーネント
export const Home = () => {
  // Stateの初期化
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();

  // イベントハンドラーの定義
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);

  // リストの取得
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, [cookies.token]);

  // 選択中のリストが変更された時の処理
  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== 'undefined') {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
          console.log(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists, cookies.token]);

  // 選択中のリストが変更された時の処理
  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
        console.log(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  // JSXを返す
  return (
    <div>
      {/* ヘッダーコンポーネントの表示 */}
      <Header />
      <main className="taskList">
        {/* エラーメッセージの表示 */}
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              {/* リスト新規作成と選択中のリスト編集へのリンク */}
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          {/* リストタブ */}
          <ul className="list-tab">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li
                  key={key}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSelectList(list.id);
                    }
                  }}
                >
                  {list.title}
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              {/* タスク新規作成へのリンク */}
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            {/* タスクの表示フィルタリング */}
            <div className="display-select-wrapper">
              <select
                id="displaySelect"
                name="displaySelect"
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            {/* タスク一覧の表示 */}
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;
  const RemainingTime = (limit) => {
    console.log(limit);
    if (!limit) {
      return '';
    }
    const now = new Date();
    const deadlineDate = new Date(limit);
    const differenceInMilliseconds = deadlineDate - now;

    const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor(
      (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
    );

    return `${days}日 ${hours}時間 ${minutes}分`;
  };

  // 完了済みタスクの表示
  if (isDoneDisplay === 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => task.done === true)
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
                <br />
                {`期限: ${task.limit}`}
                <br />
                {`残り日時: ${RemainingTime(task.limit)}`}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  // 未完了タスクの表示
  return (
    <ul>
      {tasks
        .filter((task) => task.done === false)
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.done ? '完了' : '未完了'}
              <br />
              {`期限: ${task.limit}`}
              <br />
              {`残り日時: ${RemainingTime(task.limit)}`}
            </Link>
          </li>
        ))}
    </ul>
  );
};

// PropTypesの追加
Tasks.propTypes = {
  tasks: PropTypes.array,
  selectListId: PropTypes.string,
  isDoneDisplay: PropTypes.string,
  RemainingTime: PropTypes.string,
};
