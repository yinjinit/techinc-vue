<template>
  <v-container
    id="dashboard"
    fluid
  >
    <v-skeleton-loader
      v-if="!users.length"
      type="card, article, table-tbody"
    />

    <v-data-table
      v-else
      :headers="headers"
      :items="users"
      sort-by="FirstName"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
          flat
          color="white"
        >
          <v-toolbar-title>{{ $route.name }}</v-toolbar-title>
          <v-spacer />
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on }">
              <v-btn
                color="primary"
                dark
                class="mb-2"
                v-on="on"
              >
                New User
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedUser.FirstName"
                        label="First Name"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedUser.LastName"
                        label="Last Name"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedUser.Username"
                        label="User Name"
                        :disabled="editedIndex !== -1"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                    >
                      <v-text-field
                        v-model="editedUser.Email"
                        label="Email"
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editUser(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteUser(item)"
        >
          mdi-delete
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize"
        >
          Reset
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex'
  import UserApi from '@/services/api/Users'

  export default {
    name: 'Users',
    data: () => ({
      dialog: false,
      headers: [
        {
          text: 'First Name',
          align: 'start',
          value: 'FirstName',
        },
        { text: 'Last Name', value: 'LastName' },
        { text: 'Email', value: 'Email' },
        { text: 'User Name', value: 'Username' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      users: [],
      editedIndex: -1,
      editedUser: {
        FirstName: '',
        LastName: '',
        Email: '',
        Username: '',
      },
      defaultUser: {
        FirstName: '',
        LastName: '',
        Email: '',
        Username: '',
      },
    }),
    computed: {
      ...mapState(['user']),
      formTitle () {
        return this.editedIndex === -1 ? 'New User' : 'Edit User'
      },
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
    },
    mounted () {
      this.initialize()
    },
    methods: {
      async initialize () {
        this.users = await UserApi.getAllUsers()
      },
      editUser (usr) {
        this.editedIndex = this.users.indexOf(usr)
        this.editedUser = Object.assign({}, usr)
        this.dialog = true
      },
      deleteUser (usr) {
        const index = this.users.indexOf(usr)
        confirm('Are you sure you want to delete this usr?') &&
          this.users.splice(index, 1)
      },
      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedUser = Object.assign({}, this.defaultUser)
          this.editedIndex = -1
        })
      },
      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.users[this.editedIndex], this.editedUser)
        } else {
          this.users.push(this.editedUser)
        }
        this.close()
      },
    },
  }
</script>
