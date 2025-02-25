import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import './signin.scss';
import { useDispatch, useSelector } from 'react-redux';
import { signIn } from '../authSlice';
import { url } from '../const';

// SignIn コンポーネント
export const SignIn = () => {
  // Reduxの状態とディスパッチの取得
  const auth = useSelector((state) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Stateの初期化
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState();
  const [_, setCookie] = useCookies(); // eslint-disable-line

  // イベントハンドラーの定義
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // サインイン処理
  const onSignIn = () => {
    axios
      .post(`${url}/signin`, { email: email, password: password })
      .then((res) => {
        // サインイン成功時の処理
        setCookie('token', res.data.token);
        dispatch(signIn());
        navigate('/');
      })
      .catch((err) => {
        // サインイン失敗時のエラーメッセージ設定
        setErrorMessage(`サインインに失敗しました。${err}`);
      });
  };

  useEffect(() => {
    //認証済みの場合はホームページにリダイレクト
    if (auth) {
      navigate('/', { replace: true });
      return; // または適当なコンポーネントを返す
    }

    navigate('/signin', { replace: true });

    // クリーンアップ関数を定義
    return () => {
      // 任意のクリーンアップ処理
    };
  }, [auth, navigate]); // authが変更されたときに再実行

  // JSXを返す
  return (
    <div>
      {/* ヘッダーコンポーネントの表示 */}
      <Header />
      <main className="signin">
        <h2>サインイン</h2>
        {/* エラーメッセージの表示 */}
        <p className="error-message">{errorMessage}</p>
        {/* サインインフォーム */}
        <form className="signin-form">
          <label className="email-label" htmlFor="userid">
            メールアドレス
          </label>
          <br />
          <input
            type="email"
            id="userid"
            name="email"
            className="email-input"
            onChange={handleEmailChange}
            autoComplete="email" // ←ここを追加
          />
          <br />
          <label className="password-label" htmlFor="passid">
            パスワード
          </label>
          <br />
          <input
            type="password"
            id="passid"
            name="password"
            className="password-input"
            onChange={handlePasswordChange}
            autoComplete="current-password"
          />
          <br />
          <button type="button" className="signin-button" onClick={onSignIn}>
            サインイン
          </button>
        </form>
        {/* 新規作成へのリンク */}
        <Link to="/signup">新規作成</Link>
      </main>
    </div>
  );
};
