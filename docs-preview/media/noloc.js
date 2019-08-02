const noLocRegex = /:::no-loc\stext=\"([a-zA-Z'-\s]*)\":::/gm;
const noLocFrontRegex = /:::no-loc\stext=\"/;
const noLocBackRegex = /":::/;
var noLocMatches = document.body.innerHTML.match(noLocRegex);
noLocMatches.map(match => {
  const noLocText = match.replace(noLocFrontRegex, "").replace(noLocBackRegex, "");
  document.body.innerHTML = document.body.innerHTML.replace(match, noLocText);
});
