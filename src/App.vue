<style lang="scss">
$list-border-radius: 0;
$list-dense-content-padding: 0;

#nav-drawer {
  background-image: url("./assets/bgPattern.png");
  background-repeat: repeat;
}
</style>

<template>
  <v-app id="inspire">
    <v-app-bar app clipped-left dark>
      <v-toolbar-title>Application</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer id="nav-drawer" :mini-variant="miniVariant" permanent clipped dark app>
      <v-list dense light color="grey lighten-1">
        <v-list-item>
          <v-list-item-action>
            <v-icon @click.stop="miniVariant = !miniVariant">mdi-menu</v-icon>
          </v-list-item-action>
        </v-list-item>

        <v-list-group
          v-for="(item, i) in items"
          :key="i"
          v-model="item.action"
          :prepend-icon="item.icon"
        >
          <template v-slot:activator>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </template>

          <v-list-item v-for="(subitem, j) in item.items" :key="j" link>
            <v-list-item-icon>
              <v-icon>{{ subitem.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="subitem.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <v-container class="fill-height" fluid>
        <Dashboard />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Dashboard from "./components/Dashboard";

export default {
  name: "App",

  props: {
    source: String
  },
  components: {
    Dashboard
  },

  data: () => ({
    items: [
      {
        title: "Dashboard",
        icon: "mdi-view-dashboard-outline",
        items: [
          { title: "My Dashboard", icon: "mdi-chart-bar" },
          { title: "Live Dashboard", icon: "mdi-antenna" },
          { title: "Slideshow", icon: "mdi-play-box-outline" }
        ]
      },
      {
        title: "Time",
        icon: "mdi-clock-outline",
        items: [
          { title: "Reconciliation", icon: "mdi-scale-balance" },
          { title: "Downtime Stopwatch", icon: "mdi-alarm" }
        ]
      },
      {
        title: "Maintenance",
        icon: "mdi-wrench-outline",
        items: [{ title: "Work Request", icon: "mdi-water" }]
      },
      {
        title: "Settings",
        icon: "mdi-cog-outline",
        items: [
          { title: "Users", icon: "mdi-account-multiple" },
          { title: "Asset", icon: "mdi-factory" },
          { title: "Structure", icon: "mdi-file-tree" }
        ]
      }
    ],
    miniVariant: false
  })
};
</script>
