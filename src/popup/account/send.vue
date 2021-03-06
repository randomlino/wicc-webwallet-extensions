<template>
  <div class="content-wrapper">
    <nav-bar :title="$t('account.send.title')"></nav-bar>
    <div class="content-body">
      <div class="from-title">{{ $t('account.send.fromLabel') }}</div>
      <div class="from-address">{{ activeAddress }}</div>

      <wallet-input
          v-model="destAddr"
          :label="$t('account.send.destLabel')"
          :placeholder="$t('account.send.destPlaceHolder')">
      </wallet-input>

      <wallet-input
          v-model="value"
          type="number"
          postfix="WICC"
          :label="$t('account.send.valueLabel')"
          :placeholder="$t('account.send.valuePlaceHolder')">
      </wallet-input>

      <wallet-input
          v-model="desc"
          :label="$t('account.send.descLabel')">
      </wallet-input>

      <fees-slider v-model="fees"></fees-slider>
    </div>

    <div class="content-footer">
      <button
          :disabled="!valid"
          class="display-block btn-primary"
          @click="confirmSend">{{ $t('account.send.confirmButton') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .content-wrapper {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .content-body {
    flex: 1 0 0;
    padding: 0 16px 16px;
  }

  .content-footer {
    padding: 0 16px;
  }

  .from-title, .from-address {
    color: #717680;
    font-size: 15px;
    padding: 2px;
  }

  .from-address {
    margin-bottom: 12px;
  }
</style>

<script type="text/jsx">
  import WalletInput from '../components/input'
  import NavBar from '../components/nav-bar'
  import FeesSlider from '../components/fees-slider'
  import API from '../api'
  import formatError from '../api/format-error'
  import StateWatcher from './state-watcher'

  export default {
    components: {
      WalletInput,
      FeesSlider,
      NavBar
    },

    mixins: [StateWatcher],

    computed: {
      valid() {
        return this.destAddr && this.value
      }
    },

    methods: {
      confirmSend() {
        if (!this.validateAddress(this.destAddr)) return

        this.$loading(this.$t('account.send.confirmLoading'))

        API.send(this.network || 'testnet', this.activeAddress, this.destAddr, this.value, this.fees, this.desc)
          .then(() => {
            this.$toast(this.$t('account.send.sendSuccess'), {
              type: 'center'
            })
            this.$loading.close()

            window.history.go(-1)
          }, (error) => {
            this.$toast(this.$t('account.send.sendFailure') + ' ' + formatError(error), {
              type: 'center',
              duration: 5000,
              wordWrap: true
            })
            this.$loading.close()
          })
      }
    },

    data() {
      return {
        destAddr: null,
        value: null,
        desc: null,
        fees: 0.0001
      }
    }
  }
</script>
