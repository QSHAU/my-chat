<script>
    import { Route, Router } from "svelte-routing";
    import api from "./Data/api";
    import Store from "./Data/Store/Store.svelte";
    import LazyRoute from "./Components/LazyRoute/LazyRoute.svelte";
    import AuthMiddleware from "./Middleware/AuthMiddleware.svelte";

    const Login = () => import("./States/Auth/Login.svelte");
    const Register = () => import("./States/Auth/Register.svelte");
    const Chat = () => import("./States/Chat/Chat.svelte");
    const NotFound = () => import("./States/NotFound/NotFound.svelte");

    const isAuth = async() => {
        const result = await api.get('/auth/isAuth')
        .then((result) => {
            return result.data.success;
        }).catch((error) => {
            console.log(error);
            return false;
        });
        return result;
    }
    
</script>

<div class="page">
    <Store>
        <Router>
            <LazyRoute path="/login" component={Login} delayMs={500}>
                <h4 class="loader">Loading...</h4>
            </LazyRoute>
            <LazyRoute path="/register" component={Register} delayMs={500}>
                <h4 class="loader">Loading...</h4>
            </LazyRoute>
            {#await isAuth()}
                <h4 class="loader">Loading...</h4>
            {:then authResult}
                <AuthMiddleware isAuthenticated={authResult} falseRedirectTo={'/login'}>
                    <LazyRoute path="/chat" component={Chat} isAuth={() => isAuth}>
                        <h4 class="loader">Loading...</h4>
                    </LazyRoute>
                    <LazyRoute path="*" component={NotFound} />
                </AuthMiddleware>
            {/await}
        </Router>
    </Store>
</div>

<style lang="scss">
    .page {
        flex-grow: 1;
        background-color: #8babd8;
        width: 100%;
        margin: auto;
        position: relative;

        .loader {
            font-size: 34px;
            color: #eee;
            margin: 0;
            transform: translate(-50%, -50%);
            top: 50%;
            left: 50%;
            position: absolute;
        }
    }
</style>
