const socket= io()

const $messageForm = document.querySelector('#message')
const $messageFormInput = $messageForm.querySelector('#text')
const $messageFormButton = $messageForm.querySelector('#send-message')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username , room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoScroll = ()=>{

    //new message
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    
    //Height of container
    const containerHeight = $messages.scrollHeight

    //how far scrolled
    const scrollOffset  = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight<= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)

    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)

    const loc = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt : moment(message.createdAt).format('h:mm A')
  
    })
    $messages.insertAdjacentHTML('beforeend',loc)
    autoScroll()
})

socket.on('roomData',({ room, users })=>{

    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message=document.querySelector('#text').value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error)
        {
            return console.log(error)
        }
        console.log('Message Delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocaton is not supported by your browser!')
    }
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        const lat =position.coords.latitude
        const long=position.coords.longitude

        socket.emit('sendLocation',{lat,long},()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location Sent!')
        })
       $sendLocationButton.removeAttribute('disabled')
    })
}) 

socket.emit('join',{username , room},(error)=>{
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})