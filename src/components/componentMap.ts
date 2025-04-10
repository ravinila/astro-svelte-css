
import Header from "./Header.svelte";
import Child from "./Child.svelte";
import Hero from "./Hero.svelte";
// import Footer from "./Footer.svelte";
import { createTrackedComponent } from "../utils";

export const componentMap: Record<string, unknown> = {
    Header,
    Child,
    Hero,
    // Footer,
};
// export const componentMap: Record<string, unknown> = {
//     Header: createTrackedComponent(Header, "Header"),
//     Child: createTrackedComponent(Child, "Child"),
//     Hero: createTrackedComponent(Hero, "Hero"),
//     Footer: createTrackedComponent(Footer, "Footer"),
// };
