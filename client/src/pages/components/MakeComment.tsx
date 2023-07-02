import { hostname } from 'os';
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import httpClient from '../../httpClient';
import '../../styles/makepost.css';
import imageCompression from 'browser-image-compression';

import { hostURL } from '../../httpClient';

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
            setBody("");
            setLoading(false)
          } else{
              setLoading(true)
              const resp = await httpClient.post(hostURL + 'makecomment', {
                body,
                "origin_id": params.postid,
                "comment_on": commentOn,
                "subforum": params.subforum,
                "university": params.university,
            });
            func(resp.data)
            setBody("");
            setLoading(false)
            }
            setMedia(undefined)
        } catch (error: any) {
            console.log(error)
        }
      }
} 

  const selectFile = (e:any) => {
    const ext = e.target.files[0].name.split('.').pop();
    const validext = ['jpg', 'jpeg', 'gif', 'png']
    for (let i=0; i <= validext.length; i++) {
      if (ext === validext[i]) {
        console.log(ext);
        setFileName(e.target.files.name)
        const compress = async() => {
          try {
            const compressed = await imageCompression(e.target.files[0], {maxSizeMB:0.1})
            setMedia(compressed)
          } catch(error) {console.log(error)}
        } 
        if (ext != 'gif') {compress()}
        else {setMedia(e.target.files[0])}
        return;
      }
    }
    console.log('wrong file type')
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
          {!isLoading? <button disabled={false} className="makepost-submit" type="button" onClick={() => submit()}>Submit</button>:
            <button disabled={true} className="makepost-submit" type="button">Submit</button>}
      </div>
    </div>
  )
}

export default MakeComment