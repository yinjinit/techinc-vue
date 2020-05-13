<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
    allow-overflow
  >
    <template v-slot:activator="{ on }">
      <v-btn
        small
        v-bind="$attrs"
        :class="className"
        v-on="on"
      >
        {{ title + ': ' }}
        {{ selected.length > 0 ? selected.join(', ') : $t('all') }}
      </v-btn>
    </template>
    <v-list v-if="menu">
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
      >
        <v-checkbox
          v-model="selected"
          dense
          :label="item.value !== undefined ? item.value : item"
          :value="item.key !== undefined ? item.key : item"
          :hide-details="true"
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
        type: Array,
        default: undefined,
      },
      default: {
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
    computed: {
    },
    mounted () {
    },
    methods: {
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
