package org.example

import kotlin.system.exitProcess;

 import okhttp3.OkHttpClient
 import okhttp3.Request
 import okhttp3.WebSocket
 import okhttp3.WebSocketListener
 import okio.ByteString

 class App {
     private val client = OkHttpClient()
     private val gameserverUrl = "ws://localhost:8080/play"
     private val playerName = "KotlinBot"

     fun start() {
         val request = Request.Builder().url(gameserverUrl).build()
         val listener = EchoWebSocketListener(playerName)
         val webSocket: WebSocket = client.newWebSocket(request, listener)
     }

     private class EchoWebSocketListener(val playerName: String) : WebSocketListener() {
         var i = 0
         var directions = arrayOf("LEFT", "BOMB", "LEFT", "DOWN", "DOWN", "RIGHT", "RIGHT", "UP", "UP")

         override fun onOpen(webSocket: WebSocket, response: okhttp3.Response) {
             webSocket.send("JOIN " + playerName + ".kt")
         }

         override fun onMessage(webSocket: WebSocket, text: String) {
             // Print received game state
             // println("$text")

             // Decide on action
             val action: String = directions[i % directions.size]!!
             i++
             println(action)

             // Send to game server
             webSocket.send(action)
         }

         override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
             println("Received bytes: ${bytes.hex()}")
         }

         override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
             println(reason)
             webSocket.close(1000, null)
             exitProcess(1)
         }

         override fun onFailure(webSocket: WebSocket, t: Throwable, response: okhttp3.Response?) {
             t.printStackTrace()
         }
     }
 }

 fun main() {
     val webSocketClient = App()
     webSocketClient.start()
 }

