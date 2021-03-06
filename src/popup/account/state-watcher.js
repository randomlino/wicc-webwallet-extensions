import API from '../api'
import eventBus from './bus'

export default {
  created () {
    this.eventBus.$on('network-change', this.handleNetworkChange)
    this.eventBus.$on('active-account-change', this.handleActiveAccountChange)
    this.refreshState()
  },

  destroyed () {
    this.eventBus.$off('network-change', this.handleNetworkChange)
    this.eventBus.$off('active-account-change', this.handleActiveAccountChange)
  },

  methods: {
    validateAddress (address) {
      const from = this.activeAddress || ''
      const network = from[0] === 'w' ? 'testnet' : 'mainnet'
      address = address || ''

      let valid = true
      if (network === 'testnet') {
        valid = address[0] === 'w'
      } else if (network === 'mainnet') {
        valid = address[0] === 'W'
      }

      if (valid) {
        valid = address.length === 34
      }

      if (!valid) {
        this.$toast(network === 'testnet'
          ? this.$t('account.send.testnetAddressInvalid')
          : this.$t('account.send.addressInvalid'), {
          type: 'center'
        })
      }

      return valid
    },

    handleNetworkChange (network) {
      this.network = network

      this.refreshState()
    },

    handleActiveAccountChange (account) {
      this.activeAccount = account

      this.refreshState()
    },

    refreshState () {
      return API.getState().then((state) => {
        if (state.isLocked) {
          return this.gotoWelcome()
        }
        this.network = state.network
        this.accounts = state.accounts || []
        this.tokens = state.tokens
        this.activeAccount = state.activeAccount
        this.activeAddress = state.activeAddress
      })
    },

    gotoWelcome () {
      this.$router.push({
        name: 'welcome'
      })
    }
  },

  data () {
    return {
      network: 'mainnet',
      accounts: [],
      tokens: [],
      activeAccount: null,
      activeAddress: null,
      eventBus
    }
  }
}
