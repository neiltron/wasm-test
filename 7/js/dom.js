import html2canvas from 'html2canvas';

const canvas = {
  canvas: null
};

console.log(document.querySelector("#content"))
html2canvas(document.querySelector("#content"), {
  backgroundColor: null
}).then(_canvas => {
  console.log(_canvas)
  // document.body.appendChild(_canvas);
  canvas.canvas = _canvas;

  document.body.classList.add('rendered');
});

export default canvas;