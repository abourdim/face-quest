bluetooth.startUartService()
basic.showString("BLE")

function ack(text: string) {
    bluetooth.uartWriteLine(text)
}

ack("BOOT:microbit ready")

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let msg = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    msg = msg.trim().toUpperCase()

    ack("RX:" + msg)

    if (msg == "MATCH") {
        // Face recognized
        basic.showIcon(IconNames.Yes)
        pins.digitalWritePin(DigitalPin.P0, 1)

        ack("ACK:MATCH")
        ack("STATE:P0=1")
    }
    else if (msg == "ENROLLED") {
        // Face successfully trained
        basic.showIcon(IconNames.Happy)
        basic.pause(500)
        basic.showIcon(IconNames.Heart)

        ack("ACK:ENROLLED")
    }
    else if (msg == "NO") {
        basic.showIcon(IconNames.No)
        pins.digitalWritePin(DigitalPin.P0, 0)

        ack("ACK:NO")
        ack("STATE:P0=0")
    }
    else if (msg == "TEST") {
        basic.showString("T")
        ack("ACK:TEST")
    }
    else {
        basic.showString("?")
        ack("ERR:UNKNOWN_CMD")
    }
})
