<script lang="ts">
  export let heading: string = "Welcome to the Hero Section";
  export let subheading: string =
    "This is a place for your call-to-action or introduction.";

  const handleClick = () => {
    alert("Button clicked!");
  };
</script>

<section class="hero darch">
  <div class="hero-content">
    <h2>{heading}</h2>
    <p>{subheading}</p>
    <button on:click={handleClick}>Learn More</button>
  </div>
</section>

<style>
  .hero.darch {
    background-color: #7cb9f9;
    color: white;
    padding: 2rem;
    text-align: center;
    margin-bottom: 20px;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero h2 {
    font-size: 2.5rem;
    margin: 0;
  }

  .hero p {
    font-size: 1.2rem;
    margin: 1rem 0;
  }

  .hero button {
    background-color: white;
    color: #007bff;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 5px;
  }

  .hero button:hover {
    background-color: #f0f0f0;
  }
</style>
