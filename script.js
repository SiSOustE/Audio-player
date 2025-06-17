//  список допустимых MIME-типов:
const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']

// обработка кнопки
function chooseFile() {
	const input = document.createElement('input') // создает элемент, но не встраивает в DOM / на страницу
	input.type = 'file'

	// выбор файла / аналог drop
	input.onchange = function (e) {
		const file = e.target.files[0]
		loadToPlayer(file)
	}

	input.click()
}

// обработка ввода ссылки
function processLink() {
	const link = document.getElementById('linkInput').value // ? → linkInput
	const player = document.getElementById('player')

	player.src = link
	player.load()
}

// Есть информация о песне и артисте → как бы получить?
function setSongInfo(fileContent) {
	const tags = new jsmediatags.Reader().setArrayBuffer(fileContent).read().tags
	const title = tags.title || 'Неизвестно'
	const artist = tags.artist || 'Неизвестный исполнитель'

	document.getElementById('song').textContent = title
	document.getElementById('artist').textContent = artist

	if (tags.picture) {
		const data = tags.picture.data
		const format = tags.picture.format
		let base64String = ''
		for (let i = 0; i < data.length; i++) {
			base64String += String.fromCharCode(data[i])
		}
		const url = 'data:' + format + ';base64,' + window.btoa(base64String)
		document.getElementById('cover').src = url
	} else {
		document.getElementById('cover').src = 'placeholder.png' // резервная обложка
	}
}

function loadToPlayer(file) {
	const player = document.getElementById('player')

	// Проверка формата
	if (!allowedMimeTypes.includes(file.type)) {
		alert('Пожалуйста, выберите аудиофайл (MP3, WAV, OGG)')
		return
	}

	const reader = new FileReader()
	reader.onload = function (e) {
		setSongInfo(e.target.result)
	}
	reader.readAsArrayBuffer(file)

	// Очистка старой ссылки перед созданием новой
	if (player.src && player.src.startsWith('blob:')) {
		URL.revokeObjectURL(player.src)
	}

	player.src = URL.createObjectURL(file)
	player.load()
}

function initDropzone() {
	const dropzone = document.getElementById('dropzone')

	dropzone.addEventListener('dragover', (e) => {
		e.preventDefault()
		e.stopPropagation()
		dropzone.classList.add('dragover')
	})

	dropzone.addEventListener('dragleave', (e) => {
		e.preventDefault()
		e.stopPropagation()
		dropzone.classList.remove('dragover')
	})

	dropzone.addEventListener('drop', (e) => {
		e.preventDefault()
		e.stopPropagation()
		dropzone.classList.remove('dragover')

		const file = e.dataTransfer.files[0]
		loadToPlayer(file)
	})
}

window.onload = () => {
	initDropzone()

	const player = document.getElementById('player')

	player.addEventListener('error', () => {
		alert('Ошибка воспроизведения. Проверьте файл или ссылку.')
	})

	// Очистка ссылки при закрытии страницы
	window.addEventListener('beforeunload', () => {
		if (player.src && player.src.startsWith('blob:')) {
			URL.revokeObjectURL(player.src)
		}
	})
}
