export POSTGRES_URL='postgresql://public_status_test_user@localhost:5432/public_status_test'
export POSTGRES_USE_SSL=false
export ALLOWED_PKS='020e0e8f88a63aea5687650ed303bd823aa626e732719ced2256fe143361ec8514,02f551393ecbae2e6bc997528fd8644549ca6aef283aac7f812af2e551bd0171df,03c74446ca03a0dafc3e81d6ea248eb281a6fd71633081221c6a8f482241996b90,03acf1ae3616a5bcc3af2e119a9ab2df4dba8735645475c02de1b72bfbcfb1851f,02b9b6ef684e06b3c88fce8f5ea1cc6a29c104068c936ba9eade20f194fa126000,02674b60d6712d0629d4bb2b2ad18383670ac0fc225139991f0bc03d34b551e200'
export REQUIRED_PARTICIPANTS=4
export MINIMUM_PARTICIPANTS=1
export VETO_NUMBER=3
export TIMEOUT_THRESHOLD_SECONDS=157680000 # 5 years
export USE_ORIGINAL_STATUS_TIME=true

# export ALLOWED_PKS='03bc166a669b92a9b169c943013c57cce01f7cc441c3e29340b700143091add58b,028d64c7759f986f1629d600e82d58d825504d711960379361e379e6cb612cc210,022f1c84514fcc20df0ea0de455a866f4380af59b4169e5c7610bcb8be28893410,03c925f32cfb457216d0fa686a48d73551df96abd7be9505bbca48a5fd7d3cda49,03994351b75ee919e31eecc42534b1d10dfebc37048d53171422d2a9932a3345aa,023a5bacb4dba45c8a64ff47c5fa6f4b3abecc32bbb01410cc0bbfb333d5347baf'

#export EVENT_STATUS_THRESHOLDS='[{"key":"finished","count":4},{"key":"in-reward","count":2},{"key":"pending-reward","count":2},{"key":"in-payment","count":4},{"key":"rejected","count":3},{"key":"timeout","count":3},{"key":"reached-limit","count":3},{"key":"payment-waiting","count":3},{"key":"reward-waiting","count":3},{"key":"pending-payment","count":2}]'
#export TX_STATUS_THRESHOLDS='[{"key":"completed","count":4},{"key":"invalid","count":4},{"key":"sent","count":4},{"key":"signed","count":2},{"key":"in-sign","count":4}]'
