const link =
	'http://api.weatherstack.com/current?access_key=dba639d59373106c9cb1d1721f4a1868'

const root = document.getElementById('root')
const popup = document.getElementById('popup')
const textInput = document.getElementById('text-input')
const form = document.getElementById('form')

let store = {
	city: 'London',
	temperature: 0,
	observationTime: '00:00 AM',
	isDay: 'yes',
	description: '',
	properties: {
		cloudcover: {},
		humidity: {},
		windSpeed: {},
		pressure: {},
		uvIndex: {},
		visibility: {},
	},
}

/*Асинхронно получает данные о погоде, используя запрос к API. Извлекает информацию о текущих погодных условиях 
(температура, влажность, скорость ветра и т.д.)*/
const fetchData = async () => {
	try {
		const query = localStorage.getItem('query') || store.city
		const result = await fetch(`${link}&query=${query}`)
		const data = await result.json()

		const {
			current: {
				cloudcover,
				temperature,
				humidity,
				observation_time: observationTime,
				pressure,
				uv_index: uvIndex,
				visibility,
				is_day: isDay,
				weather_descriptions: description,
				wind_speed: windSpeed,
			},
			location: { name },
		} = data

		store = {
			...store,
			isDay,
			city: name,
			temperature,
			observationTime,
			description: description[0],
			properties: {
				cloudcover: {
					title: 'cloudcover',
					value: `${cloudcover}%`,
					icon: 'cloud.png',
				},
				humidity: {
					title: 'humidity',
					value: `${humidity}%`,
					icon: 'humidity.png',
				},
				windSpeed: {
					title: 'wind speed',
					value: `${windSpeed} km/h`,
					icon: 'wind.png',
				},
				pressure: {
					title: 'pressure',
					value: `${pressure} %`,
					icon: 'gauge.png',
				},
				uvIndex: {
					title: 'uv Index',
					value: `${uvIndex} / 100`,
					icon: 'uv-index.png',
				},
				visibility: {
					title: 'visibility',
					value: `${visibility}%`,
					icon: 'visibility.png',
				},
			},
		}

		renderComponent()
	} catch (err) {
		console.log(err)
	}
}
/*Возвращает имя файла изображения в зависимости от описания погоды. */
const getImage = description => {
	const value = description.toLowerCase()

	switch (value) {
		case 'partly cloudy':
			return 'partly.png'
		case 'cloud':
			return 'cloud.png'
		case 'fog':
			return 'fog.png'
		case 'sunny':
			return 'sunny.png'
		case 'cloud':
			return 'cloud.png'
		default:
			return 'the.png'
	}
}

/*генерирует HTML-код для отображения списка свойств,
 включая иконки, значения и описания.*/
const renderProperty = properties => {
	return Object.values(properties)
		.map(({ title, value, icon }) => {
			return `<div class="property">
            <div class="property-icon">
              <img src="./img/icons/${icon}" alt="">
            </div>
            <div class="property-info">
              <div class="property-info__value">${value}</div>
              <div class="property-info__description">${title}</div>
            </div>
          </div>`
		})
		.join('')
}

/*Создает HTML-разметку для отображения информации о погоде в заданном городе.
Использует данные из объекта store, чтобы показать название города, описание погоды, температуру и тд. */
const markup = () => {
	const { city, description, observationTime, temperature, isDay, properties } =
		store
	const containerClass = isDay === 'yes' ? 'is-day' : ''

	return `<div class="container ${containerClass}">
            <div class="top">
              <div class="city">
                <div class="city-subtitle">Weather Today in</div>
                  <div class="city-title" id="city">
                  <span>${city}</span>
                </div>
              </div>
              <div class="city-info">
                <div class="top-left">
                <img class="icon" src="./img/${getImage(description)}" alt="" />
                <div class="description">${description}</div>
              </div>
            
              <div class="top-right">
                <div class="city-info__subtitle">as of ${observationTime}</div>
                <div class="city-info__title">${temperature}°</div>
              </div>
            </div>
          </div>
        <div id="properties">${renderProperty(properties)}</div>
      </div>`
}

const togglePopupClass = () => {
	popup.classList.toggle('active')
}

/*обновляет элемент root, добавляя разметку, и устанавливает обработчик клика на элемент с ID city,
который переключает класс всплывающего окна. */
const renderComponent = () => {
	root.innerHTML = markup()

	const city = document.getElementById('city')
	city.addEventListener('click', togglePopupClass)
}

const handleInput = e => {
	store = {
		...store,
		city: e.target.value,
	}
}

/*обрабатывает отправку формы, предотвращает стандартное поведение, сохраняет город в localStorage,
вызывает функцию fetchData и переключает класс всплывающего окна. */
const handleSubmit = e => {
	e.preventDefault()
	const value = store.city

	if (!value) return null

	localStorage.setItem('query', value)
	fetchData()
	togglePopupClass()
}

form.addEventListener('submit', handleSubmit)
textInput.addEventListener('input', handleInput)

fetchData()
