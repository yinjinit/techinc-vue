<template>
  <div class="d-flex">
    <v-menu
      :ref="randDateRef"
      v-model="menuDate"
      :close-on-content-click="false"
      :return-value.sync="dateData"
      offset-y
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="dateData"
          append-icon="event"
          dense
          outlined
          hide-details
          :rules="[rules.date]"
          class="base-date-picker"
          v-on="on"
        />
      </template>
      <v-date-picker
        v-model="dateData"
        no-title
        scrollable
        :min="minDate"
        :max="maxDate"
      >
        <v-spacer />
        <v-btn
          text
          @click="menuDate = false"
        >
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="$refs[randDateRef].save(dateData)"
        >
          {{ $t('ok') }}
        </v-btn>
      </v-date-picker>
    </v-menu>
    <v-menu
      v-if="timeData !== undefined"
      :ref="randTimeRef"
      v-model="menuTime"
      :close-on-content-click="false"
      :return-value.sync="timeData"
      transition="scale-transition"
      offset-y
      min-width="240px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="timeData"
          append-icon="access_time"
          filled
          outlined
          hide-details
          :rules="[rules.time]"
          class="base-time-picker ml-1"
          v-on="on"
        />
      </template>
      <v-time-picker
        v-if="menuTime"
        v-model="timeData"
        full-width
        format="24hr"
        :min="minDate==dateData ? minTime : undefined"
        :max="maxDate==dateData ? maxTime : undefined"
        @click:minute="$refs[randTimeRef].save(timeData)"
      />
    </v-menu>
  </div>
</template>

<script>
  export default {
    name: 'DateTimePicker',
    props: {
      datetime: {
        type: Date,
        default: undefined,
      },
      min: {
        type: Date,
        default: undefined,
      },
      max: {
        type: Date,
        default: undefined,
      },
    },
    data: () => ({
      menuDate: false,
      menuTime: false,
      rules: {
        date: v => {
          const pattern = /^\d{4}-\d{2}-\d{2}$/
          return pattern.test(v)
        },
        time: v => {
          const pattern = /^\d{2}:\d{2}$/
          return pattern.test(v)
        },
      },
    }),
    computed: {
      randDateRef () {
        return 'dateTimePicker-' + Math.random().toString(16).substr(2, 9)
      },
      randTimeRef () {
        return 'dateTimePicker-' + Math.random().toString(16).substr(2, 9)
      },
      minDate () {
        return this.min !== undefined ? this.getDate(this.min) : undefined
      },
      maxDate () {
        return this.max !== undefined ? this.getDate(this.max) : undefined
      },
      minTime () {
        return this.min !== undefined ? this.getTime(this.min) : undefined
      },
      maxTime () {
        return this.max !== undefined ? this.getTime(this.max) : undefined
      },
      dateData: {
        get () {
          return this.getDate(this.datetime)
        },
        set (val) {
          this.$emit('update:datetime', new Date(val + ' ' + this.timeData))
        },
      },
      timeData: {
        get () {
          return this.getTime(this.datetime)
        },
        set (val) {
          this.$emit('update:datetime', new Date(this.dateData + ' ' + val))
        },
      },
    },
    mounted () {
      this.dateData = this.getDate(this.datetime)
      this.timeData = this.getTime(this.datetime)
    },

    methods: {
      getDate (val) {
        return val.getFullYear() +
          '-' + ('0' + (val.getMonth() + 1)).slice(-2) +
          '-' + ('0' + val.getDate()).slice(-2)
      },
      getTime (val) {
        return ('0' + val.getHours()).slice(-2) +
          ':' + ('0' + val.getMinutes()).slice(-2)
      },
    },
  }
</script>

<style lang="scss">
  .base-date-picker.v-text-field--outlined.v-input--dense {
    max-width: 130px;

    .v-input__control {
      .v-input__slot {
        min-height: 30px;

        input {
          font-size: 13px;
        }
      }

      .v-input__append-inner {
        margin-top: 4px;

        .v-icon {
          font-size: 18px;
        }
      }
    }
  }

  .base-time-picker.v-text-field {
    max-width: 90px;

    .v-input__control {
      .v-input__slot {
        min-height: 30px;

        input {
          font-size: 13px;
        }
      }

      .v-input__append-inner {
        margin-top: 4px;

        .v-icon {
          font-size: 18px;
        }
      }
    }
  }
</style>
