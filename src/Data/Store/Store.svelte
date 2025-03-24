<script>
	import { setContext } from "svelte";
    import { writable } from "svelte/store";

    const isAuth = writable(false);
    const searchUserActive = writable(false);
    const selectedChat = writable(false);
    const chatDetails = writable(false);
    const chats = writable([]);
    const messages = writable([]);

    setContext('store', {
        isAuth,
        searchUserActive,
        chats,
        selectedChat,
        messages,
        chatDetails,
    })
</script>

<slot />