import React from 'react'

export default () => (
  <div
    id='revue-embed'
    className='rounded shadow bg-gray-100 p-4 my-3 font-sans'
  >
    <h3 className='font-black text-black text-base font-sans'>
      Like this post?
    </h3>
    <div className='text-gray-800 text-sm'>
      I'm experimenting with a newsletter. Sign up here if you're interested.
    </div>
    <form
      action='https://www.getrevue.co/profile/michaelhelvey/add_subscriber'
      method='post'
      id='revue-form'
      name='revue-form'
      target='_blank'
      className='font-sans flex flex-col p-0 m-0'
    >
      <div className='flex md:flex-row flex-col items-baseline'>
        <input
          className='px-3 my-2 py-2 text-sm rounded focus:shadow outline-none md:w-64 w-auto'
          placeholder='Email'
          type='email'
          name='member[email]'
          id='member_email'
        />
        <input
          className='md:mx-3 mx-0 bg-green-700 text-white leading-loose text-sm px-4 py-1 rounded'
          type='submit'
          value='Subscribe'
          name='member[subscribe]'
          id='member_submit'
        />
      </div>
    </form>
  </div>
)
