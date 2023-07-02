import React, { Component, useContext, useState } from 'react'
import httpClient from '../../httpClient';
import validator from 'validator';
import { useParams } from 'react-router-dom';
import '../../styles/makeforum.css'
import { hostURL } from '../../httpClient';

const MakeSubForum: React.FC<{func?: Function}> = ({func}) => {
    const [title, setTitle] = useState(String)
    const params = useParams()

    const submitPost = async () => {
        if (title.length > 0) {
            if (validator.isAlphanumeric(title)) {
                try {
                    const res = await httpClient.post(hostURL + 'makeforum', {
                        title,
                    });
                    //window.location.reload();
                    // try {
                    //     const rep = await httpClient.post(hostURL + 'getforums', {
                    //         "quantity": 20,
                    //         "start": 0,
                    //         "university": params.university
                    //     });
                    //    func? func(rep.data) : window.location.href = `/forums/${params.university}/${res.data.id}`
                    // } catch (error) {
                    // }
                    window.location.href = `/forums/${params.university}/${res.data.id}`
                    setTitle("");
                } catch (error: any) {
                    console.log(error);
                }
            }
            else {
                console.log("title must be alphanumeric"); //add error thingy here prob
            }
        }
    }
  return (
        <div className='make-forum-wrapper'>
                <div className='make-forum-input'>
                    <input
                        maxLength={22}
                        placeholder="Create Subforum"
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className='make-forum-button-wrapper'>
                    <button type="button" onClick={() => submitPost()}>Submit</button>
                </div>
        </div>
  )
}

export default MakeSubForum