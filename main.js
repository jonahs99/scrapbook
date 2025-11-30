import { html, render } from "https://unpkg.com/lit-html?module";
import { mountDoodle } from "./doodle/doodle.js";

const doodles = ["tree", "canyon", "fracture", "wave", "coast", "growth"];

const template = html`
  ${doodles.map(
    (name) => html`
      <div class="doodle">
        <a id=${`link-${name}`} href=${`doodle/?doodle=${name}`}>
          <h3>${name}</h3>
          <canvas id=${`canvas-${name}`}></canvas>
        </a>
      </div>
    `,
  )}
`;

render(template, document.getElementById("doodles"));

for (const name of doodles) {
  const canvas = document.getElementById(`canvas-${name}`);
  mountDoodle(name, canvas).then((link) => {
    document.getElementById(`link-${name}`).href = link;
  });
}
