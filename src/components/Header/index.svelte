<script lang="ts">
  export let title: string = "Welcome to My Website";
  import "./bootstrap.css";
</script>

<header class="header darch">
  <h1>{title}</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
</header>

<style>
  .header.darch {
    background-color: #4ad694;
    color: white;
    padding: 1rem;
    text-align: center;
    margin-bottom: 20px;
  }

  .header h1 {
    margin: 0;
    font-size: 2rem;
  }

  .header nav {
    margin-top: 1rem;
  }

  .header a {
    color: white;
    margin: 0 0.5rem;
    text-decoration: none;
  }

  .header a:hover {
    text-decoration: underline;
  }
</style>
