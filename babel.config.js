module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Fuerza a Babel a transformar los campos/métodos privados de clases (#campo)
          // en vez de asumir que el Hermes del dispositivo los soporta de forma nativa.
          // Esto evita el error "private properties are not supported".
          unstable_transformProfile: "default",
        },
      ],
    ],
  };
};
