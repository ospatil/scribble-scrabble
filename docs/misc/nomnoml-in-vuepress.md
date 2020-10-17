---
tags: ["misc", "vuepress", "diagram"]
---

# UML Diagrams in Vuepress using nomnoml

<TagLinks />

> **TL;DR** Install my *markdown-it* plugin `npm i -D @ospatil/markdown-it-nomnoml`, configure it as mentioned in [documentation](https://vuepress.vuejs.org/guide/markdown.html#advanced-configuration) and use *```nomnoml* code blocks.

## Final Result

I searched and couldn't find any *markdown-it* plugin for *nomnoml* so created the one metioned above.

```nomnoml
[Pirate|eyeCount: Int|raid();pillage()|
  [beard]--[parrot]
  [beard]-:>[foul mouth]
]

[<table>mischief | bawl | sing || yell | drink]

[<abstract>Marauder]<:--[Pirate]
[Pirate]- 0..7[mischief]
[jollyness]->[Pirate]
[jollyness]->[rum]
[jollyness]->[singing]
[Pirate]-> *[rum|tastiness: Int|swig()]
[Pirate]->[singing]
[singing]<->[rum]

[<start>st]->[<state>plunder]
[plunder]->[<choice>more loot]
[more loot]->[st]
[more loot] no ->[<end>e]

[<actor>Sailor] - [<usecase>shiver me;timbers]
```

## Worthy Mention: Using Vue Component

It can also be done through custom vue component. Install required packages - `dagre` and `nomnoml` and create a custom component with following code:

```js
// File - docs/.vuepress/components/Nomnoml.vue

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
```

Then, use the `<Nomnoml>` components in markdown:

  ```html
    <Nomnoml>
    ```
    [<actor>Sailor] - [<usecase>shiver me;timbers]
    ```
    </Nomnoml>
  ```

> Since *nomnoml* syntax uses angular brackets, it was necessary to enclose it in backticks to let *markdown-it* process it as code block and then jumping through hoops to get hold of the *nomnoml* syntax text in the component code.

Below is the result of rendering it through the custom component.

<Nomnoml>
```
[<actor>Sailor] - [<usecase>shiver me;timbers]
```
</Nomnoml>
