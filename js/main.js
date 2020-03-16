(() => {
  'use strict'

  const list = document.querySelector('.ajax-section .cities')
  const input = document.querySelector('.top-banner input')
  const form = document.querySelector('.top-banner form')
  const msg = document.querySelector('.top-banner .msg')
  const dateTemp = document.querySelector('.dateTemp')
  const select = document.querySelector('.select')
  const checkValue = []

  let rusToLatin = ( str ) => {
    const ru = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 
        'е': 'e', 'ё': 'e', 'ж': 'j', 'з': 'z', 'и': 'i', 
        'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 
        'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'u', 'я': 'ya'
    }, n_str = []
    str = str.replace(/[ъь]+/g, '').replace(/й/g, 'i')
    for ( let i = 0; i < str.length; ++i ) {
       n_str.push(
              ru[ str[i] ]
           || ru[ str[i].toLowerCase() ] == undefined && str[i]
           || ru[ str[i].toLowerCase() ].replace(/^(.)/, function ( match ) { return match.toUpperCase() })
       )
    }
    return n_str.join('')
  }

  let defaultOption = () => {
    const option = `
      <option value="test" value="default" class="option-elem">CHOOSE DATE</option>
    `
    select.innerHTML = option
  }

  let addOptions = (value) => {
    const option = `
      <option value=${ value } class="option-elem" >${ value }</option>
    `
    return option
  }

  let getData = async (inputVal) => {
    if(inputVal.trim() === '') {
      msg.textContent = 'Please search for a valid city'
      return
    }
    msg.textContent = ''
    const apiKey = '0ae7fd0bfe89ff1c33a9ff35012d6d82'
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${inputVal},BY&appid=${apiKey}&units=metric`
    const request = await fetch(url)
    const response = await request.json()
    return response
  }

  let getYear = () => {
    const getDate = new Date().toLocaleDateString().split('.').reverse().join('-')
    const year = `${getDate}`
    return year
  }

  let setListenersToOption = (data) => {
    const selectOptionValue = document.querySelector('.select')
    let createCadrFromOptionDate = (data) => {
      let getDateFromOption = (e) => {
        e.preventDefault()
        const oneDayData = data.list.filter((element) => element.dt_txt.slice(0,10) === e.target.value)
        let resultMarkup = ``
        
        oneDayData.forEach((element) => {
          const { city: { name },  city: { country } } = data
          const { weather, main, dt_txt } = element
          const icon = `https://openweathermap.org/img/wn/${
            weather[0]["icon"]
          }@2x.png`;
          const markup = `
            <li class="city">
              <span class="ajaxDateList">${dt_txt}</span>
              <h2 class="city-name" data-name="${name},${country}">
                <span>${name}</span>
                <sup>${country}</sup>
              </h2>
              <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
              <figure>
                <img class="city-icon" src=${icon} alt=${weather[0]['main']}>
                <figcaption>${weather[0]['description']}</figcaption>
              </figure>
            </li>
          `
          resultMarkup += markup
        })
        dateTemp.innerHTML = resultMarkup
      }
      selectOptionValue.addEventListener('change', getDateFromOption)
    }
    createCadrFromOptionDate(data)
  }

  let setOptionsDate = (data) => {
    const optionsData = data.list.map((element) => element.dt_txt.slice(0,10))
    const set = new Set()
    let options = ``
    optionsData.forEach((element) => set.add(element))
    Array.from(set).forEach((element) => {
      options += addOptions(element, select)
    })
    select.innerHTML = options
    select[0].disabled = true
    setListenersToOption(data)
  }

  let createCard = async () => {
    const inputVal = rusToLatin(input.value)
    for (let i = 0; i < checkValue.length; i++) {
      if (checkValue[i].name.toUpperCase().trim() === inputVal.toUpperCase().trim()) {
        return
      }
    }
    dateTemp.innerHTML = ''
    checkValue.push({
      name: inputVal
    });
    
    const data = await getData(inputVal)
    const oneDayData = data.list.filter((element) => element.dt_txt.slice(0,10) === getYear())
    const { city: { name } } = data
    checkValue.push({
      name
    });
    let resultMarkup = ``
    
    oneDayData.forEach((element) => {
      const { city: { name },  city: { country } } = data
      const { weather, main, dt_txt } = element
      const icon = `https://openweathermap.org/img/wn/${
        weather[0]["icon"]
      }@2x.png`;
      const markup = `
        <li class="city">
          <span class="ajaxDateList">${dt_txt}</span>
          <h2 class="city-name" data-name="${name},${country}">
            <span>${name}</span>
            <sup>${country}</sup>
          </h2>
          <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
          <figure>
            <img class="city-icon" src=${icon} alt=${weather[0]['main']}>
            <figcaption>${weather[0]['description']}</figcaption>
          </figure>
        </li>
      `
      resultMarkup += markup
    })
    list.innerHTML = resultMarkup
    input.value = ''
    setOptionsDate(data)
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    input.focus()
    createCard()
      .catch(() => msg.textContent = 'Please search for a valid city')
  })

  form.addEventListener('reset', (e) => {
    e.preventDefault()
    list.innerHTML = ''
    dateTemp.innerHTML = ''
    checkValue.length = 0
    defaultOption()
  })
  defaultOption()
 
})()
