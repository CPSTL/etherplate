import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import range from 'lodash.range'
import classnames from 'classnames'

import nfToken from '@/contracts/nfTokenFactory'

import { addTokenAction } from '@/redux/actions'

import TokenType from '../token-type'
import Ether from '@/components/ether'

import nfTokenTypeImageUrl from '@/services/nfToken-type-image-url'

import style from './style.scss'

const CustomizeToken = class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      price: '',
      tokenType: 0,
      title: '',
      titleError: '',
      errorMessage: '',
      redirectToTokenList: false
    }
  }

  componentDidMount() {
    let that = this;
    nfToken(window.web3).then((instance) => {
      instance.getCurrentPrice().then( (price) => {
        that.setState({ price: price.toString() })
      });
    }).catch(function(error) {
      console.error(error)
    })
  }

  async onClickSave () {
    // Reset the error handling
    this.setState({ titleError: '' })

    // TODO: Replace these magic numbers with an app-wide config:
    if (this.state.title.length < 1) {
      this.setState({ titleError: 'Please enter at least 1 character for the title' })
    } else {
      let contractInstance

      await nfToken(window.web3).then(function(instance) {
        contractInstance = instance
      }).catch(function(error) {
        console.error(error)
      })

      const txHash = await contractInstance.buyToken.sendTransaction(
        this.state.tokenType,
        this.state.title,
        { value: this.state.price }
      )

      this.props.addToken({ transactionHash: txHash })
      this.setState({ redirectToTokenList: true })
    }
  }

  onClickTokenType (index) {
    this.setState({ tokenType: index })
  }

  render () {
    if (this.state.redirectToTokenList)
      return <Redirect to={'/tokens/all'} />

    if (this.state.titleError)
      var titleError =
        <p className="help is-danger">{this.state.titleError}</p>

    if (this.state.errorMessage)
      var errorMessage = <p className='help is-danger'>{this.state.errorMessage}</p>

    return (
      <section className='section'>
        <div className='container'>
          <div className='columns'>
            <div className='column is-one-half-desktop'>

              <div className="etherplate-form">
                <div className="etherplate-form--wrapper">
                  <div className="columns is-mobile">
                    {range(2).map(index => {
                      var selected = this.state.tokenType === index
                      return (
                        <div key={index} className="column rotate-in-center is-one-fifth-mobile is-one-fifth-tablet is-one-fifth-desktop">
                          <TokenType
                            url={nfTokenTypeImageUrl(index, 'small')}
                            onClick={() => this.onClickTokenType(index)}
                            selected={selected} />
                        </div>
                      )
                    })}
                  </div>

                  <div className="field">
                    <label className="label">Price</label>
                    <div className="control">
                      <Ether wei={this.state.price} />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Title</label>
                    <div className="control">
                      <input
                        placeholder={`Name your ${this.state.tokenType == 0 ? 'sword' : 'shield'}`}
                        className="input"
                        value={this.state.title}
                        onChange={(e) => this.setState({ title: e.target.value })} />
                    </div>
                    {titleError}
                  </div>

                  <br />
                  <p>
                    <button
                      disabled={this.state.selectedToken === null}
                      className={classnames('button is-success is-medium')}
                      onClick={(e) => this.onClickSave()}>
                      Buy Token
                    </button>
                  </p>
                  {errorMessage}
                </div>
              </div>
            </div>

            <div className='column is-one-third'>
              <figure className="image is-square">
                <img src={nfTokenTypeImageUrl(this.state.tokenType)} />
              </figure>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToken: (token) => {
      dispatch(addTokenAction(token))
    }
  }
}

export default connect(null, mapDispatchToProps)(CustomizeToken)
