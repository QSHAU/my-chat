<script>
    import { getContext } from "svelte";
    import { link, navigate } from 'svelte-routing';
    import api from "../../Data/api";

  
    const {isAuth} = getContext('store');
    
    let email;
    let password;
    let userData = {};

    const formSubmit = async (e) => {
        e.preventDefault();
        userData = {
            email,
            password,
        }
        await api.post('auth/login',
        {
            email,
            password
        }, 
        { 
            withCredentials: false 
        })
        .then(function (response) {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('userId', response.data.user.id);
            $isAuth = true;
            alert('You have success login')
            navigate('/chat', { replace: true })
            return response.data.data;
        })
        .catch(function (error) {
            alert('Incorrect login or password');
            console.log(error);
        });
    }
</script>

<div class="login">
    <h1 class="login__title">
        Login/Register
    </h1>
    <form class="login-form" on:submit={(e) => formSubmit(e)}>
        <label class="login-label">
            Email
            <input type="email" bind:value={email} placeholder="Email">
        </label>
        <label class="login-label">
            Login
            <input type="password" bind:value={password} placeholder="Password">
        </label>
        <div class="login-form__wrapper">
            <button type="submit">Log In</button>
            <a class="reg-btn" href="/register" use:link>Sign Up</a>
        </div>
    </form>
</div>

<style lang="scss">
    .login {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 650px;
        background-color: #FFF;
        border-radius: 12px;
        padding: 20px;
        transform: translate(-50%, -50%);
        top: 50%;
        left: 50%;
        position: absolute;

        &__title {
            font-size: 24px;
            text-align: center;
            font-weight: 700;
            color: #011627;
            margin: 0 0 40px;
        }

        &-form {
            display: flex;
            flex-direction: column;
            justify-content: center;
            grid-gap: 10px;
            margin-bottom: 15px;

            &__wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                margin-top: 20px;
            }
        }

        &-label {
            display: flex;
            flex-direction: column;
            margin: 0 auto;
            max-width: 250px;
            font-size: 12px;
            line-height: 14px;
            color: #011627;

            &:first-child {
                margin: 0 auto 10px;
            }
        }

        input {
            display: block;
            font-size: 16px;
            font-weight: 500;
            line-height: 1;
            max-width: 220px;
            border: 1px solid #ccc;
            padding: 8px 12px;
            margin-top: 2px;
            border-radius: 10px;
            color: #011627;
            background-color: transparent;
            outline: none;

            &::placeholder {
                color: #ccc;
            }
        }

        button[type="submit"] {
            font-size: 17px;
            line-height: 24px;
            font-weight: 500;
            color: #FFF;
            padding: 20px;
            border-radius: 16px;
            max-width: 200px;
            width: 100%;
            align-self: center;
            border: none;
            background-color: #8BABD8;
            cursor: pointer;
            transition: background-color .3s; 

            &:hover {
                background-color: #9abae7;
            }
        }

        .reg-btn {
            display: inline-block;
            font-size: 17px;
            line-height: 24px;
            font-weight: 500;
            color: #fff;
            text-align: center;
            text-decoration: none;
            padding: 20px;
            border-radius: 16px;
            max-width: 200px;
            width: 100%;
            align-self: center;
            border: none;
            background-color: #707991;
            cursor: pointer;
            transition: background-color .3s;

            &:hover {
                background-color: #8892ac;
            }
        }
    }
</style>