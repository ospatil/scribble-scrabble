<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
export default {
  beforeMount() {
    Promise.all([import('dagre/dist/dagre'), import('nomnoml/dist/nomnoml')]).then(([dagre, nomnoml]) => {
      // to allow use of angular brackets in the nomnoml syntax in custom component, it needs to be wrapped in ``` code blocks.
      // this.$slots.default[0]this.$slots.default[0] gives us a div
      // next children[0] gives us pre tag
      // next children[0] gives us code tag
      // last children[0].text gives us the actual text content of <Nomnoml></Nomnoml> tag
      const diagramText = this.$slots.default[0].children[0].children[0].children[0].text;
      nomnoml.draw(this.$refs.canvas, diagramText);
    });
  }
};
</script>
