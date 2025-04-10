<script>
    import Child from "./Child.svelte";
</script>

<header class="header">
    <h1>CSS Test</h1>
    <nav>
        Child List
        <Child />
    </nav>
</header>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #b0c353;
        color: white;
    }
    :global(ul.list-style-disc) {
        list-style-type: disc;
    }
</style>
