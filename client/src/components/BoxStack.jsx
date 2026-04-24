const BoxStack = ({ t }) => {
  const colors = ["#D85A30", "#BA7517", "#185FA5", "#3B6D11", "#993556"];

  return (
    <div style={{ position: "relative", width: 140, height: 160, margin: "0 auto 2rem" }}>
      {[4, 3, 2, 1, 0].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 80 + i * 10,
            height: 36,
            left: `calc(50% - ${(80 + i * 10) / 2}px)`,
            bottom: i * 30,
            background: colors[i],
            borderRadius: 6,
            boxShadow: `0 ${4 + i * 2}px ${8 + i * 4}px rgba(0,0,0,0.2)`,
            animation: `floatBox${i} 3s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "60%", height: 3, background: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
        </div>
      ))}

      <style>{`
        @keyframes floatBox0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes floatBox1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes floatBox2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes floatBox3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatBox4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
      `}</style>
    </div>
  );
};

export default BoxStack;