import wallet from './wallet/index'

const TYPE_PATH_MAP = {
  contract: '/window/contract',
  publicContract: '/window/publish-contract',
  requestPay: '/window/request-pay',
  requestVote: '/window/request-vote'
}

const getQueryString = (args) => {
  let result = []
  Object.keys(args).forEach((key) => {
    const value = args[key]
    let valueString
    if (typeof value === 'object') {
      valueString = encodeURIComponent(JSON.stringify(value))
    } else {
      valueString = encodeURIComponent(value)
    }
    result.push(encodeURIComponent(key) + '=' + valueString)
  })
  return result.join('&')
}

const openWindow = async (type, args) => {
  const path = TYPE_PATH_MAP[type]
  const queryString = getQueryString(args)
  const popupURL = chrome.extension.getURL('pages/popup.html#' + path + '?' + queryString)

  return chrome.windows.create({
    url: popupURL,
    type: 'popup',
    height: 600,
    width: 375
  })
}

export default {
  async getDefaultAccount () {
    const state = await wallet.getState()
    if (state.isLocked) {
      throw new Error('Please unlock wallet first')
    }

    const {
      activeAccount,
      network,
      activeAddress,
      vaultCreated
    } = state

    if (!vaultCreated) {
      throw new Error('Please create wallet first')
    }

    return {
      account: activeAccount ? { address: activeAccount.address, id: activeAccount.id, testnetAddress: activeAccount.testnetAddress } : null,
      network,
      address: activeAddress
    }
  },

  async openWindow () {
    const popupURL = chrome.extension.getURL('pages/popup.html#/window/contract')

    return chrome.windows.create({
      url: popupURL,
      type: 'popup',
      height: 600,
      width: 375
    })
  },

  async openContractWindow ({ destRegId, contract, value, callbackId }) {
    const state = await wallet.getState()
    if (state.isLocked) {
      throw new Error('Please unlock wallet first')
    }

    return openWindow('contract', {
      destRegId,
      contract,
      value,
      callbackId
    })
  },

  async publishContract ({ script, scriptDesc, callbackId }) {
    const state = await wallet.getState()
    if (state.isLocked) {
      throw new Error('Please unlock wallet first')
    }

    return openWindow('publicContract', {
      script,
      scriptDesc,
      callbackId
    })
  },

  async requestPay ({ destAddress, value, desc, callbackId }) {
    const state = await wallet.getState()
    if (state.isLocked) {
      throw new Error('Please unlock wallet first')
    }

    return openWindow('requestPay', {
      destAddress,
      value,
      desc,
      callbackId
    })
  },

  async requestVote ({ votes, callbackId }) {
    const state = await wallet.getState()
    if (state.isLocked) {
      throw new Error('Please unlock wallet first')
    }

    return openWindow('requestVote', {
      votes,
      callbackId
    })
  },

  handleMessage (action, data) {
    data = data || {}
    return new Promise((resolve, reject) => {
      if (typeof this[action] === 'function') {
        this[action](data).then(resolve, reject)
      } else {
        reject(new Error('unknown action ' + action))
      }
    })
  }
}
