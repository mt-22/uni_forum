import { hostname } from 'os';
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import httpClient from '../../httpClient';
import '../../styles/makepost.css';
import imageCompression from 'browser-image-compression';

import { hostURL } from '../../httpClient';
import { Button } from 'react-bootstrap';

const MakeComment:React.FC<{func:Function, commentOn:string}> = ({func, commentOn}) => {
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<File>();
  const [fileName, setFileName] = useState("")
  const params = useParams();
  // console.log(posts)
  const [isLoading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const submit = async () => {
    if (body.length > 0 || media) {
        inputRef.current!.value = "";
        inputRef.current!.files = null;
        try {
           if (media) {
            const formData = new FormData();
            formData.append('media', media)
            setLoading(true)
            const resp = await httpClient.post(hostURL + 'uploadimage', formData);
            console.log(resp.data) 
            const postresp = await httpClient.post(hostURL + 'makecomment', {
                    body,
                    "origin_id": params.postid,
                    "comment_on": commentOn,
                    "subforum": params.subforum,
                    "university": params.university,
                    "media": resp.data.fileid
            }); 
            func(postresp.data)
          } else{
              setLoading(true)
              const resp = await httpClient.post(hostURL + 'makecomment', {
                body,
                "origin_id": params.postid,
                "comment_on": commentOn,
                "subforum": params.subforum,
                "university": params.university,
            });
              console.log(resp.data.body, resp.data.comment_on)
            func(resp.data)
            }
            setMedia(undefined)
            setBody("");
            setLoading(false)
            setFileName("")
        } catch (error: any) {
            console.log(error)
        }
      }
} 

  const selectFile = (e:any) => {
    const ext = e.target.files[0].name.split('.').pop().toLowerCase();
    const validext = ['jpg', 'jpeg', 'gif', 'png']
    for (let i=0; i <= validext.length; i++) {
      if (ext === validext[i]) {
        setFileName(e.target.files[0].name)
        const compress = async() => {
          try {
            const compressed = await imageCompression(e.target.files[0], {maxSizeMB:0.05, maxWidthOrHeight:800})
            setMedia(compressed)
          } catch(error) {console.log(error)}
        } 
        if (ext != 'gif') {compress()}
        else {setMedia(e.target.files[0])}
        return;
      }
    }
    console.log('wrong file type', ext)

  }
  return (
    <div className='makepost'>
      <h2 className='create-post-head'>Comment</h2>
      <div className='makepost-form-wrapper'>
          <textarea
              className='makepost-input makepost-body makecomment-body'
              placeholder='Body'
              value={body}
              onChange={(e) => setBody(e.target.value)}
          />
          <label className='makepost-file-input-wrapper makecomment-file-wrapper'>
            <input
                ref={inputRef}
                accept='.jpg, .jpeg, .png, .gif'
                className='makepost-input makepost-file-input'
                type="file"
                onChange={selectFile}
            />
            Choose File
          </label>
          <p>{fileName}</p>
          {!isLoading? <Button disabled={false} className="makepost-submit red-btn" onClick={() => submit()}>Submit</Button>:
            <Button disabled={true} className="makepost-submit red-btn">Submit</Button>}
      </div>
    </div>
  )
}

export default MakeComment