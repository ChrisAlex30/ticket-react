import React, { useEffect,useState } from 'react'

const Loadingdialog = ({isloading}) => {

    const [loading,setloading]= useState('hide')

    useEffect(()=>{
        if(isloading)
        setloading('show')     
        else
        setloading('hide')
    },[isloading])
  return (
    <div className={`spinner-container ${loading}`}>
        <div className='loading-spinner'>

        </div>
    </div>
  )
}

export default Loadingdialog