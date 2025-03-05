<script>
    import { navigate } from "svelte-routing";

    export let isAuthenticated = false;
    export let falseRedirectTo = '/login';

    if(!isAuthenticated) {
        navigate(falseRedirectTo, {replace: true})
    }
</script>

<slot />