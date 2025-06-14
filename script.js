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
	// принимает контент файла → распарсим / прочитаем → воспользуемся возможностью библиотеки mp3Tag
	const mp3Tags = new MP3Tag(fileContent)
	// получим метаданные, которые лежат в файле
	// это также не возможности браузера, а возможности библиотеки
	mp3Tags.read()

	// у нее внутри лежит такой объект
	const {
		v1: { title, artist }, // название песни и исполнителя
		v2: { APIC }, // более специфичная информация / массив с байтами ~ обложка альбома
	} = mp3Tags.tags
	const coverBytes = APIC[0].data
	const coverUrl =
		'data:image/png;base64,' +
		btoa(String.fromCharCode.apply(null, new Uint8Array(coverBytes))) //из байт сформировать картинку → / в url → data с типом в кодировке base64 / btoa → приведение к строке → кодировка ASCI → вытащить из метаинформации данные

	// взято из метатегов
	document.getElementById('song').textContent = title
	document.getElementById('artist').textContent = artist
	document.getElementById('cover').src = coverUrl
}

function loadToPlayer(file) {
	// загруз файл в player
	const player = document.getElementById('player')

	// Вызвать setSongInfo. Невозможно получить массив байт из input. Надо их считать. Воспользуемся API по работе с файлами. Создадим объект  file reader
	const reader = new FileReader()

	reader.onload = (e) => {
		const content = e.target.result // контент файла в объекте target свойстве result → массив байт
		setSongInfo(content)
	}

	reader.readAsArrayBuffer(file) // прочитать файл как ArrayBuffer

	player.src = URL.createObjectURL(file) // из файла сделать URL для браузера

	// начни обрабатывать файл → грузить его контент

	player.load()
}

function initDropzone() {
	const dropzone = document.getElementById('dropzone')

	dropzone.addEventListener('dragover', (e) => {
		// обработка события dragover
		e.preventDefault()
		e.stopPropagation()
	})

	dropzone.addEventListener('drop', (e) => {
		// обработка события drop
		e.preventDefault()
		e.stopPropagation()

		const file = e.dataTransfer.files[0] // dataTransfer отвечает за данные в элементе, который drop
		loadToPlayer(file)
	})
}

window.onload = () => {
	initDropzone()
}
