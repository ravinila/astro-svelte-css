<script>
    export let heading = "Welcome to My Website";
    export let subtext = "This is a simple hero section using Svelte.";
  </script>
  
  <section class="hero">
    <h2>{heading}</h2>
    <p>{subtext}</p>
    <button>Get Started</button>
  </section>
  
  <style>
    .hero {
      text-align: center;
      padding: 4rem;
      background: #f4f4f4;
    }
  
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      background: #0070f3;
      color: white;
      cursor: pointer;
    }
  </style>