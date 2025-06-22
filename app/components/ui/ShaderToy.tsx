export const ShaderToy = () => {
  return (
    <iframe
      width="120%"
      height="120%"
      frameBorder="0"
      src="https://www.shadertoy.com/embed/MsXXWH?gui=false&t=10&paused=false&muted=false"
      allowFullScreen
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: "-10%",
        left: "-10%",
        width: "120%",
        height: "120%",
        zIndex: -1,
      }}
    ></iframe>
  );
};
