<script>
	import { setContext } from "svelte";
    import { writable } from "svelte/store";
    // import api from "../api";
    // import option from "../option";

    const isAuth = writable(false);
    const searchUserActive = writable(false);
    const selectedChat = writable(false);
    const chatDetails = writable(false);
    const messages = writable([]);

    setContext('store', {
        isAuth,
        searchUserActive,
        selectedChat,
        messages,
        chatDetails,
    })
</script>

<slot />