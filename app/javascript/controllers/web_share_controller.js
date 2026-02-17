import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { title: String, text: String, url: String, files: String }

  connect() {
    this.element.hidden = typeof navigator.share !== "function"
  }

  async share() {
    await navigator.share(await this.#getShareData())
  }

  async #getShareData() {
    const data = { title: this.titleValue, text: this.textValue }

    if (this.urlValue) {
      data.url = this.urlValue
    }

    if (this.filesValue && this.#canShareFiles) {
      const file = await this.#getFileObject()
      if (navigator.canShare({ files: [ file ] })) {
        data.files = [ file ]
      }
    }

    return data
  }

  async #getFileObject() {
    const response = await fetch(this.filesValue)
    const blob = await response.blob()
    const randomPrefix = `Campfire_${Math.random().toString(36).slice(2)}`
    const fileName = `${randomPrefix}.${blob.type.split('/').pop()}`

    return new File([ blob ], fileName, { type: blob.type })
  }

  get #canShareFiles() {
    return typeof navigator.canShare === "function"
  }
}
