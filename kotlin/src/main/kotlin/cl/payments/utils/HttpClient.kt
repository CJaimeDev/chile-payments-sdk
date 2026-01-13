package cl.payments.utils

import cl.payments.types.ProviderException
import cl.payments.types.TimeoutException
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

// Cliente HTTP base para hacer requests
class HttpClient(
    private val baseUrl: String,
    private val timeout: Long = 30000
) {
    val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(timeout, TimeUnit.MILLISECONDS)
        .readTimeout(timeout, TimeUnit.MILLISECONDS)
        .writeTimeout(timeout, TimeUnit.MILLISECONDS)
        .build()
    
    // Public para que las funciones inline puedan acceder
    val gson = Gson()
    val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    private val customHeaders = mutableMapOf<String, String>()

    // GET request
    inline fun <reified T> get(url: String, headers: Map<String, String> = emptyMap()): T {
        val request = buildRequest(url, headers)
        return executeRequest(request)
    }

    // POST request
    inline fun <reified T> post(
        url: String,
        data: Any? = null,
        headers: Map<String, String> = emptyMap()
    ): T {
        val body = if (data != null) {
            gson.toJson(data).toRequestBody(jsonMediaType)
        } else {
            "".toRequestBody(jsonMediaType)
        }
        
        val request = buildRequest(url, headers, "POST", body)
        return executeRequest(request)
    }

    // PUT request
    inline fun <reified T> put(
        url: String,
        data: Any? = null,
        headers: Map<String, String> = emptyMap()
    ): T {
        val body = if (data != null) {
            gson.toJson(data).toRequestBody(jsonMediaType)
        } else {
            "".toRequestBody(jsonMediaType)
        }
        
        val request = buildRequest(url, headers, "PUT", body)
        return executeRequest(request)
    }

    // DELETE request
    inline fun <reified T> delete(url: String, headers: Map<String, String> = emptyMap()): T {
        val request = buildRequest(url, headers, "DELETE")
        return executeRequest(request)
    }

    // Setear headers personalizados
    fun setHeaders(headers: Map<String, String>) {
        customHeaders.clear()
        customHeaders.putAll(headers)
    }

    // Construir request - public para funciones inline
    fun buildRequest(
        url: String,
        headers: Map<String, String>,
        method: String = "GET",
        body: RequestBody? = null
    ): Request {
        val fullUrl = if (url.startsWith("http")) url else "$baseUrl$url"
        
        val requestBuilder = Request.Builder()
            .url(fullUrl)
            .method(method, body)
        
        // Agregar headers personalizados
        customHeaders.forEach { (key, value) ->
            requestBuilder.addHeader(key, value)
        }
        
        // Agregar headers adicionales
        headers.forEach { (key, value) ->
            requestBuilder.addHeader(key, value)
        }
        
        return requestBuilder.build()
    }

    // Ejecutar request y manejar errores - public inline para reified types
    inline fun <reified T> executeRequest(request: Request): T {
        try {
            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string() ?: ""
                
                if (!response.isSuccessful) {
                    throw ProviderException(
                        message = "HTTP ${response.code}: ${response.message}",
                        provider = "unknown",
                        statusCode = response.code,
                        details = responseBody
                    )
                }
                
                return gson.fromJson(responseBody, T::class.java)
            }
        } catch (e: IOException) {
            if (e.message?.contains("timeout", ignoreCase = true) == true) {
                throw TimeoutException()
            }
            throw ProviderException(
                message = e.message ?: "Network error",
                provider = "unknown"
            )
        }
    }
}