package bestlist

import (
	"fmt"
	"log/slog"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Repository struct {
	db *sqlx.DB
}

func New(url string) (*Repository, error) {
	db, err := sqlx.Connect("postgres", url)
	if err != nil {
		return nil, fmt.Errorf("connecting: %w", err)
	}

	return &Repository{
		db: db,
	}, nil
}

type Entry struct {
	Name string `db:"name" json:"name"`
	Score string `db:"score" json:"score"`
	CreatedAt string `db:"created_at" json:"created_at"`
}

func (b *Repository) GetTop3() []Entry {
	var result []Entry

	err := b.db.Select(&result, "SELECT * FROM scores ORDER BY score DESC LIMIT 3")
	if err != nil {
		slog.Error("could not select", slog.String("error",err.Error()))
		return []Entry{} // Just fail silently
	}

	return result
}

func (b *Repository) InsertScore(name string, score int) {
	// Insert or update the score (only if it is higher)
	_, err := b.db.Exec("INSERT INTO scores(name, score) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET score = GREATEST(EXCLUDED.score, scores.score)", name, score) 
	if err != nil {
		// Fail silently if we can't store that stuff
		slog.Error("could not exec", slog.String("error",err.Error()))
	}
}

func (b *Repository) InsertState(state []byte) {
	_, err := b.db.Exec("INSERT INTO states (state) VALUES ($1)", string(state)) // Fail silently if we can't store that stuff
	if err != nil {
		// Fail silently if we can't store that stuff
		slog.Error("could not exec", slog.String("error",err.Error()))
	}
}

