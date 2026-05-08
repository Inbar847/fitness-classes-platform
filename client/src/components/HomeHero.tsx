const HomeHero = () => {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden bg-gray-950">
      <video
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1px]"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/20" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-gray-50/30 to-gray-50" />
    </section>
  );
};

export default HomeHero;