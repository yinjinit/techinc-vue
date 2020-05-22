<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
    allow-overflow
  >
    <template v-slot:activator="{on}">
      <v-btn
        small
        v-bind="$attrs"
        :class="className"
        v-on="on"
      >
        {{ title + ': ' }}
        {{ selected.length ? selected.join(', ') : $t('all') }}
      </v-btn>
    </template>
    <v-list v-if="menu">
      <v-list-item
        v-for="(key, i) in Object.keys(items)"
        :key="i"
      >
        <v-checkbox
          v-model="selected"
          dense
          :value="key"
          :label="key"
          :hide-details="true"
          @change="toggle"
        />
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  export default {
    name: 'Dropdown',
    props: {
      items: {
        type: Object,
        default: undefined,
      },
      title: {
        type: String,
        default: undefined,
      },
      className: {
        type: String,
        default: undefined,
      },
    },
    data: () => ({
      menu: false,
      selected: [],
    }),
    mounted () {
      for (const e in this.items) {
        if (!(e in this.selected) && this.items[e]) {
          this.selected.push(e)
        }
      }
    },
    methods: {
      toggle () {
        this.$emit('update:dropdown', this.selected)
      },
    },
  }
</script>

<style lang="scss">
  .v-menu__content .v-list-item {
    min-height: 32px;

    .v-input--checkbox {
      margin: 0;
    }
  }
</style>
