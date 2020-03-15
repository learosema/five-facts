import GLea from 'https://terabaud.github.io/hello-webgl/lib/glea/glea.mjs';
import { frag, vert } from './shaders.mjs';

class App {

  constructor(el) {
    this.el = el || document.querySelector('main')
    this.md = new markdownit();
  }

  async getSlides() {
    const { md } = this;
    const response = await fetch("SLIDES.md", {cache: "no-cache"})
    const text = await response.text();
    this.slides = md.render(text).split('<hr>').map((slide, idx) => {
      const div = document.createElement('div');
      div.innerHTML = slide;
      const images = [...div.querySelectorAll('img')];
      images.forEach(image => {
        image.parentElement.setAttribute('class', 'slide__image');
      });
      const anchors = [...div.querySelectorAll('a')];
      anchors.forEach(anchor => {
        anchor.setAttribute('target', '_blank');
      });
      return {
        id: 'slide' + idx,
        title: (div.querySelector('h1') || {}).textContent,
        content: div.innerHTML
      };
    });
  }

  render() {
    this.el.innerHTML = `
      ${this.slides.map((slide) => `
      <div class="slide" id="${slide.id}">
        ${slide.content}
      </div>`).join('')}
    `;
  }

  mounted() {
    Prism.highlightAll();
  }

  async run() {
    await this.getSlides();
    this.render();
    this.mounted();
  }


}

const app = new App();
app.run();


let texture = null;

const glea = new GLea({
  shaders: [
    GLea.fragmentShader(frag),
    GLea.vertexShader(vert)
  ],
  buffers: {
    'position': GLea.buffer(2, [1, 1,  -1, 1,  1,-1,  -1,-1])
  }
}).create();

function loop(time) {
  const { gl } = glea;
  glea.clear();
  glea.uni('width', glea.width);
  glea.uni('height', glea.height);
  glea.uni('time', time * .005);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(loop);
}

function setup() {
  const { gl } = glea;
  window.addEventListener('resize', () => {
    glea.resize();
  });
  loop(0);
}

setup();
