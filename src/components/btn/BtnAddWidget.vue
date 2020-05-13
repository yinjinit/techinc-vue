<template>
  <v-dialog
    v-model="dialog"
    scrollable
    width="900"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        small
        color="primary"
        v-bind="$attrs"
        v-on="on"
      >
        <v-icon left>
          mdi-plus-thick
        </v-icon>
        <span>{{ $t('add widget') }}</span>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="lighten-2"
        primary-title
      >
        Widget Gallery
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-expansion-panels popout>
          <v-expansion-panel
            v-for="cate in widgets"
            :key="cate.Id"
          >
            <v-expansion-panel-header>
              {{ cate.Description.toUpperCase() }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list>
                <fragment
                  v-for="(wg, i) in cate.Widgets"
                  :key="i"
                  class="ma-3 grey lighten-3"
                >
                  <v-list-item v-if="!wg.Hidden">
                    <v-list-item-content>
                      <v-row>
                        <v-col
                          sm="7"
                          cols="12"
                        >
                          <v-img
                            v-if="wg.PreviewImageName"
                            :src="require('@/assets/png/widgets/' +
                              wg.PreviewImageName)"
                          />
                        </v-col>
                        <v-col
                          class="col"
                          sm="5"
                        >
                          <div class="title">
                            {{ wg.Description }}
                          </div>
                          <div class="subtitle-1">
                            {{ wg.DescriptionLong }}
                          </div>
                          <v-icon
                            color="primary"
                            @click="addWidget(cate.Id, i)"
                          >
                            mdi-plus-thick
                          </v-icon>
                        </v-col>
                      </v-row>
                    </v-list-item-content>
                  </v-list-item>
                </fragment>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="dialog = false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'BtnAddWidget',
    props: {
      widgetsGrouped: {
        type: Object,
        defaults: undefined,
      },
    },
    data: () => ({
      dialog: false,
    }),
    computed: {
      widgets: {
        get () {
          return this.widgetsGrouped
        },
      },
    },
    methods: {
      addWidget (category, i) {
        this.widgets[category].Widgets[i].Hidden = true
        this.$emit('add:widget', [category, i])
        this.$forceUpdate()
      },
    },
  }
</script>

<style lang="scss">
  .v-dialog {
    .v-expansion-panels {
      padding: 40px 0 20px;

      .v-list-item {
        .v-icon {
          position: absolute;
          right: 16px;
          top: 16px;
        }
      }
    }
  }
</style>
