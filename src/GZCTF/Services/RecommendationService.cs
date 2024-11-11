using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GZCTF.Models;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace GZCTF.Services
{
    public interface IRecommendationService
    {
        Task<List<string>> GetRecommendationsForUser(string userId);
        Task UpdateUserProgress(string userId, string topic, int progress);
    }

    public class RecommendationService : IRecommendationService
    {
        private readonly ILogger<RecommendationService> _logger;
        private readonly AppDbContext _dbContext;

        public RecommendationService(ILogger<RecommendationService> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        public Task<List<string>> GetRecommendationsForUser(string userId)
        {
            try
            {
                // Simulación de lógica para obtener recomendaciones, en la práctica aquí iría una consulta a la base de datos
                _logger.LogInformation($"Obteniendo recomendaciones para el usuario: {userId}");
                var recommendations = new List<string>
                {
                    "Pentesting",
                    "Computación Forense",
                    "Ciberseguridad"
                };

                // Devolver la lista de recomendaciones como un Task
                return Task.FromResult(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener recomendaciones para el usuario {userId}");
                throw;
            }
        }

        public async Task UpdateUserProgress(string userId, string topic, int progress)
        {
            try
            {
                _logger.LogInformation($"Actualizando progreso para el usuario: {userId}, Tema: {topic}, Progreso: {progress}%");
                var userGuid = Guid.Parse(userId);
                // Busca el progreso del usuario en la base de datos.
                var userProgress = await _dbContext.UserProgresses
                    .FirstOrDefaultAsync(up => up.UserId == userGuid && up.Topic == topic);

                if (userProgress == null)
                {
                    // Si no existe el registro, se crea uno nuevo.
                    userProgress = new UserProgress
                    {
                        UserId = userGuid,
                        Topic = topic,
                        Progress = progress
                    };
                    await _dbContext.UserProgresses.AddAsync(userProgress);
                }
                else
                {
                    // Si ya existe el registro, se actualiza el progreso.
                    userProgress.Progress = progress;
                    _dbContext.UserProgresses.Update(userProgress);
                }

                // Guarda los cambios en la base de datos.
                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el progreso para el usuario {userId}");
                throw;
            }
        }
    }

    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddRecommendationService(this IServiceCollection services)
        {
            services.AddScoped<IRecommendationService, RecommendationService>();
            return services;
        }
    }
}
