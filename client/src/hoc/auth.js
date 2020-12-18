/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-anonymous-default-export */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action'
// import { withRouter } from 'react-router-dom'

export default function (SpecificComponent, option, adminRoute = null) {
    // SpecificComponent : A component to wrap
    // option = nulL : a page to everyone)
    //       = true : a page only to logged in users
    //       = false : a page not accessible for logged in users
    function AuthenticationCheck(props) {

        const dispatch = useDispatch();

        useEffect(() => {

            dispatch(auth()).then(response => {
                console.log(response)

                // user not logged in
                if(!response.payload.isAuth) {
                    if(option) {
                        props.history.push('/login')
                    }
                } else {
                    // user logged in
                    if(adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    } else {
                        if(option === false) {
                            props.history.push('/')
                        }
                    }
                }
            })
        }, [])

        return (
            <SpecificComponent {...props} />
            // HOC에서 Route가 제공한 props를 그대로 리턴해주면 
            // withRouter()를 각 페이지 컴포넌트에 적용할 필요가 없음
        )
    }

    return AuthenticationCheck
}