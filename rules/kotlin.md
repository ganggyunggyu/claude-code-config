# Android Kotlin Guidelines

## Architecture: Clean Architecture + Hilt

### Layer Structure

```
com.team.app/
├── domain/              # No Android dependencies
│   ├── model/          # Entities, value objects
│   ├── usecase/        # Business logic
│   ├── repository/     # Repository interfaces
│   └── exception/      # Domain exceptions
├── data/               # Implements domain interfaces
│   ├── network/
│   │   ├── service/   # Retrofit services
│   │   ├── dto/       # API DTOs
│   │   └── adapter/   # Custom call adapters
│   ├── repository/    # Repository implementations
│   └── local/         # Room DB, SharedPreferences
└── presentation/       # UI layer
    ├── feature/       # Feature-based composables/fragments
    └── common/        # Shared UI components
```

### Layer Dependencies

```
presentation → domain (+ DI, AndroidX)
data → domain
domain → nothing (pure Kotlin)
```

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Packages | lowercase, dot-separated | `com.team.app.data.network` |
| Classes/Interfaces | PascalCase | `BookDiscussionViewModel` |
| Functions/Properties | lowerCamelCase | `getDiscussionList()` |
| Constants | SCREAMING_SNAKE_CASE | `const val BASE_URL = "..."` |
| Booleans | is/has/should/can prefix | `isLoading`, `hasNextPage` |
| Impl classes | Impl suffix | `DiscussionRepositoryImpl` |

## Kotlin Style

- Prefer `data class`, `sealed class`, `object`, `when`
- Null-safety first: avoid unnecessary nullable types
- Prefer `val` over `var`
- 4-space indentation
- Single-expression functions when short
- Explicit return types for public APIs
- Trailing commas in multi-line parameters

## Dependency Injection (Hilt)

```kotlin
@HiltViewModel
class BookDiscussionViewModel @Inject constructor(
    private val fetchDiscussionListUseCase: FetchDiscussionListUseCase,
) : ViewModel() { ... }

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    @Provides
    fun provideDiscussionRepository(
        remoteDataSource: DiscussionRemoteDataSource,
    ): DiscussionRepository = DiscussionRepositoryImpl(remoteDataSource)
}
```

## ViewModel + StateFlow Pattern

```kotlin
data class DiscussionUiState(
    val isLoading: Boolean = false,
    val discussions: List<DiscussionItemUiModel> = emptyList(),
    val errorMessage: String? = null,
)

@HiltViewModel
class BookDiscussionViewModel @Inject constructor(
    private val fetchDiscussionListUseCase: FetchDiscussionListUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow(DiscussionUiState())
    val uiState: StateFlow<DiscussionUiState> = _uiState

    fun loadDiscussions(bookId: Long) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            when (val result = fetchDiscussionListUseCase(bookId)) {
                is NetworkResult.Success -> _uiState.update {
                    it.copy(isLoading = false, discussions = result.data.map(::toUiModel))
                }
                is NetworkResult.Failure -> _uiState.update {
                    it.copy(isLoading = false, errorMessage = mapExceptionToMessage(result.exception))
                }
            }
        }
    }
}
```

## Networking (Retrofit)

```kotlin
interface DiscussionService {
    @GET("/api/v1/discussions")
    suspend fun getDiscussions(
        @Query("bookId") bookId: Long,
    ): NetworkResult<List<DiscussionResponse>>
}
```

## Testing

```kotlin
@Test
fun `returns success when repository returns data`() {
    runTest {
        // Arrange, Act, Assert
    }
}
```

- Use JUnit 4/5, coroutine test utilities
- Fake/stub implementations over heavy mocks
- Assert on `uiState` emissions for ViewModel tests
