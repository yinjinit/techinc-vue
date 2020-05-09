<template>
  <div class="d-flex">
    <v-menu
      :ref="randDateRef"
      v-model="menuDate"
      :close-on-content-click="false"
      :return-value.sync="dateVal"
      offset-y
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="dateVal"
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
        v-model="dateVal"
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
          @click="updateDate(dateVal)"
        >
          {{ $t('ok') }}
        </v-btn>
      </v-date-picker>
    </v-menu>
    <v-menu
      v-if="time !== undefined"
      :ref="randTimeRef"
      v-model="menuTime"
      :close-on-content-click="false"
      :return-value.sync="timeVal"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          v-model="timeVal"
          append-icon="access_time"
          filled
          outlined
          hide-details
          :rules="[rules.time]"
          class="base-time-picker"
          v-on="on"
        />
      </template>
      <v-time-picker
        v-if="menuTime"
        v-model="timeVal"
        full-width
        format="24hr"
        :min="minDate==dateVal ? minTime : undefined"
        :max="maxDate==dateVal ? maxTime : undefined"
        @click:minute="updateTime(timeVal)"
      />
    </v-menu>
  </div>
</template>

<script>
  export default {
    name: 'DateTimePicker',
    props: {
      date: {
        type: String,
        default: undefined,
      },
      time: {
        type: String,
        default: undefined,
      },
      minDate: {
        type: String,
        default: undefined,
      },
      minTime: {
        type: String,
        default: undefined,
      },
      maxDate: {
        type: String,
        default: undefined,
      },
      maxTime: {
        type: String,
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
      dateVal: undefined,
      timeVal: undefined,
    }),
    computed: {
      randDateRef () {
        return Math.random().toString(10).substr(2)
      },
      randTimeRef () {
        return Math.random().toString(10).substr(2)
      },
    },
    created () {
      this.dateVal = this.date
      this.timeVal = this.time
    },
    methods: {
      updateDate (val) {
        this.$refs[this.randDateRef].save(val)
        this.$emit('update:date', val)
      },
      updateTime (val) {
        this.$refs[this.randTimeRef].save(val)
        this.$emit('update:time', val)
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
    margin-left: 4px;

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
