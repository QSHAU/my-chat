<script>
    import api from "../../Data/api";
    import { link, navigate } from 'svelte-routing';
    
    let username;
    let email;
    let password;

    const formSubmit = async (e) => {
        e.preventDefault();

        await api.post('auth/register', {
            username,
            email,
            password,
        })
        .then(function(response) {
            alert(response.data.message);
            navigate('/login', { replace: true })
            return response.data;
        })
        .catch(function(response) {
            alert(response.response.data.message);
            console.error('Error', response.message)
        })

        return false
    }
</script>

<div class="register">
    <h1 class="register__title">
        Login/Register
    </h1>
    <form class="register-form" on:submit={(e) => formSubmit(e)}>
        <label class="register-label">
            Username
            <input type="text" bind:value={username} placeholder="Username">
        </label>
        <label class="register-label">
            Email
            <input type="email" bind:value={email} placeholder="Email">
        </label>
        <label class="register-label">
            Password
            <input type="password" bind:value={password} placeholder="Password">
        </label>
        <div class="register-form__wrapper">
            <button type="submit">Create account</button>
            <a class="log-btn" href="/login" use:link>Sign In</a>
        </div>
    </form>
</div>

<style lang="scss">
    .register {
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

        & .log-btn {
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