export const appendScript = (scriptToAppend, preload) => {
  const script = document.createElement("script");
  script.src = scriptToAppend;
  if (preload) {
    script.rel = "preload";
  }
  script.async = false;
  document.body.appendChild(script);
};
